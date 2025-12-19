
import JSZip from 'jszip';

// 建议用户在生产环境中使用后端代理处理跨域
const MINERU_TOKEN = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiI4NTAwMDA4NyIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc2NjEyMTkyMSwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiIiwib3BlbklkIjpudWxsLCJ1dWlkIjoiY2FiNTJlNjItMzMxNy00MGY0LWFmNGYtZjM2NjM3ZDJkMzYzIiwiZW1haWwiOiIiLCJleHAiOjE3NjczMzE1MjF9.cy8R7yvWqD2YY62OrCNGt74Q9VfJZ2t9hCBCcOv75lskbTD7sLOUDFr_5rWwkq1p7-ujbwVGA6TSq4gcFUmDOg";

export interface MineruResult {
  markdown: string;
  images: Record<string, string>;
}

export class MineruService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    console.debug(`[MinerU] Requesting: ${url}`);
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${MINERU_TOKEN}`,
      },
    });
  }

  async processFile(file: File): Promise<MineruResult> {
    // 1. 获取上传链接
    const batchRes = await this.fetchWithAuth('https://mineru.net/api/v4/file-urls/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [{ name: file.name, data_id: `data_${Date.now()}` }],
        model_version: 'vlm'
      })
    });

    if (!batchRes.ok) {
      const errorText = await batchRes.text();
      throw new Error(`MinerU 认证失败 (HTTP ${batchRes.status}): ${errorText}`);
    }

    const batchData = await batchRes.json();
    if (batchData.code !== 0) throw new Error(`MinerU 业务错误: ${batchData.msg}`);

    const uploadUrl = batchData.data.file_urls[0];
    const batchId = batchData.data.batch_id;

    // 2. PUT 文件 (上传至云存储，通常不加 Auth Header 以免签名失效)
    console.debug(`[MinerU] Uploading file to storage...`);
    const putRes = await fetch(uploadUrl, { 
      method: 'PUT', 
      body: file,
      // 某些存储服务需要显式指定 content-type
      headers: { 'Content-Type': file.type } 
    });
    
    if (!putRes.ok) throw new Error(`文件上传至存储服务器失败 (HTTP ${putRes.status})`);

    // 3. 轮询任务状态
    console.debug(`[MinerU] Task started, ID: ${batchId}. Polling status...`);
    let taskResult: any = null;
    let attempts = 0;
    const maxAttempts = 60; // 最多等 3 分钟

    while (attempts < maxAttempts) {
      const statusRes = await this.fetchWithAuth(`https://mineru.net/api/v4/extract-results/batch/${batchId}`);
      if (!statusRes.ok) throw new Error(`查询状态失败 (HTTP ${statusRes.status})`);
      
      const statusData = await statusRes.json();
      const result = statusData.data.extract_result[0];

      if (result.state === 'done') {
        taskResult = result;
        break;
      } else if (result.state === 'failed') {
        throw new Error(result.err_msg || 'MinerU 解析失败，请检查文件格式');
      }
      
      attempts++;
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!taskResult) throw new Error('任务超时，MinerU 处理时间过长');

    // 4. 下载并解压结果
    console.debug(`[MinerU] Fetching result ZIP...`);
    const zipUrl = taskResult.full_zip_url;
    const zipBlob = await fetch(zipUrl).then(r => {
      if (!r.ok) throw new Error('结果包下载失败');
      return r.blob();
    });

    const jszip = new JSZip();
    const zipContent = await jszip.loadAsync(zipBlob);

    const images: Record<string, string> = {};
    let markdown = '';

    for (const [path, zipFile] of Object.entries(zipContent.files)) {
      const fileEntry = zipFile as any;
      if (path.endsWith('.md')) {
        markdown = await fileEntry.async('string');
      } else if (path.includes('/images/') && (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg'))) {
        const base64 = await fileEntry.async('base64');
        const ext = path.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        const fileName = path.split('/').pop() || path;
        images[fileName] = `data:${mime};base64,${base64}`;
      }
    }

    console.debug(`[MinerU] Extraction complete. Found ${Object.keys(images).length} images.`);
    return { markdown, images };
  }
}

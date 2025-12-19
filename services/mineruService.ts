
import JSZip from 'jszip';

const MINERU_TOKEN = process.env.MINERU_TOKEN || "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiI4NTAwMDA4NyIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc2NjEyMTkyMSwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiIiwib3BlbklkIjpudWxsLCJ1dWlkIjoiY2FiNTJlNjItMzMxNy00MGY0LWFmNGYtZjM2NjM3ZDJkMzYzIiwiZW1haWwiOiIiLCJleHAiOjE3NjczMzE1MjF9.cy8R7yvWqD2YY62OrCNGt74Q9VfJZ2t9hCBCcOv75lskbTD7sLOUDFr_5rWwkq1p7-ujbwVGA6TSq4gcFUmDOg";

export interface MineruResult {
  markdown: string;
  images: Record<string, string>;
}

export class MineruService {
  // 使用 Vercel Rewrites 映射的本地代理路径
  private readonly BASE_URL = '/mineru-proxy';

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    // 自动将相对路径拼接
    const fullUrl = url.startsWith('http') ? url : `${this.BASE_URL}${url}`;
    console.debug(`[MinerU] Requesting through proxy: ${fullUrl}`);
    
    return fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${MINERU_TOKEN}`,
      },
    });
  }

  async processFile(file: File): Promise<MineruResult> {
    // 1. 获取上传 URL
    const batchRes = await this.fetchWithAuth('/v4/file-urls/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [{ name: file.name, data_id: `data_${Date.now()}` }],
        model_version: 'vlm'
      })
    });

    if (!batchRes.ok) {
      const errorText = await batchRes.text();
      throw new Error(`MinerU Auth Failed (HTTP ${batchRes.status}): ${errorText}`);
    }

    const batchData = await batchRes.json();
    if (batchData.code !== 0) throw new Error(`MinerU Error: ${batchData.msg}`);

    const uploadUrl = batchData.data.file_urls[0];
    const batchId = batchData.data.batch_id;

    // 2. 上传文件 (PUT 到存储桶通常不需要代理，因为存储服务通常配置了 CORS)
    console.debug(`[MinerU] Uploading file to storage...`);
    const putRes = await fetch(uploadUrl, { 
      method: 'PUT', 
      body: file,
      headers: { 'Content-Type': file.type } 
    });
    
    if (!putRes.ok) throw new Error(`Storage upload failed (HTTP ${putRes.status})`);

    // 3. 轮询任务状态
    console.debug(`[MinerU] Task started, ID: ${batchId}. Polling status...`);
    let taskResult: any = null;
    let attempts = 0;
    const maxAttempts = 60; 

    while (attempts < maxAttempts) {
      const statusRes = await this.fetchWithAuth(`/v4/extract-results/batch/${batchId}`);
      if (!statusRes.ok) throw new Error(`Status check failed (HTTP ${statusRes.status})`);
      
      const statusData = await statusRes.json();
      const result = statusData.data.extract_result[0];

      if (result.state === 'done') {
        taskResult = result;
        break;
      } else if (result.state === 'failed') {
        throw new Error(result.err_msg || 'MinerU parsing failed');
      }
      
      attempts++;
      await new Promise(r => setTimeout(r, 3000));
    }

    if (!taskResult) throw new Error('Task timeout');

    // 4. 下载并解压结果
    console.debug(`[MinerU] Fetching result ZIP...`);
    const zipUrl = taskResult.full_zip_url;
    const zipBlob = await fetch(zipUrl).then(r => {
      if (!r.ok) throw new Error('Result download failed');
      return r.blob();
    });

    const jszip = new JSZip();
    const zipContent = await jszip.loadAsync(zipBlob);

    const images: Record<string, string> = {};
    let markdown = '';

    // Fix: Explicitly cast entries to handle unknown types in zipContent.files
    for (const [path, zipFile] of Object.entries(zipContent.files) as [string, any][]) {
      if (path.endsWith('.md')) {
        markdown = await zipFile.async('string');
      } else if (path.includes('/images/') && (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg'))) {
        const base64 = await zipFile.async('base64');
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

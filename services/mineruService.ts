
import JSZip from 'jszip';

/**
 * Note: In a production SaaS environment, you should set MINERU_TOKEN 
 * in your Vercel/Deployment environment variables.
 */
const MINERU_TOKEN = process.env.MINERU_TOKEN || "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiI4NTAwMDA4NyIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc2NjEyMTkyMSwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiIiwib3BlbklkIjpudWxsLCJ1dWlkIjoiY2FiNTJlNjItMzMxNy00MGY0LWFmNGYtZjM2NjM3ZDJkMzYzIiwiZW1haWwiOiIiLCJleHAiOjE3NjczMzE1MjF9.cy8R7yvWqD2YY62OrCNGt74Q9VfJZ2t9hCBCcOv75lskbTD7sLOUDFr_5rWwkq1p7-ujbwVGA6TSq4gcFUmDOg";

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
    // 1. Get upload URL
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
      throw new Error(`MinerU Auth Failed (HTTP ${batchRes.status}): ${errorText}`);
    }

    const batchData = await batchRes.json();
    if (batchData.code !== 0) throw new Error(`MinerU Error: ${batchData.msg}`);

    const uploadUrl = batchData.data.file_urls[0];
    const batchId = batchData.data.batch_id;

    // 2. Upload file via PUT
    console.debug(`[MinerU] Uploading file to storage...`);
    const putRes = await fetch(uploadUrl, { 
      method: 'PUT', 
      body: file,
      headers: { 'Content-Type': file.type } 
    });
    
    if (!putRes.ok) throw new Error(`Storage upload failed (HTTP ${putRes.status})`);

    // 3. Poll task status
    console.debug(`[MinerU] Task started, ID: ${batchId}. Polling status...`);
    let taskResult: any = null;
    let attempts = 0;
    const maxAttempts = 60; 

    while (attempts < maxAttempts) {
      const statusRes = await this.fetchWithAuth(`https://mineru.net/api/v4/extract-results/batch/${batchId}`);
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

    // 4. Download and unzip
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

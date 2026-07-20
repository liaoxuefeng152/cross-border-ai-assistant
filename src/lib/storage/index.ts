import { S3Storage } from "coze-coding-dev-sdk";

let storageInstance: S3Storage | null = null;

function getStorage(): S3Storage {
  if (!storageInstance) {
    storageInstance = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });
  }
  return storageInstance;
}

/**
 * 上传文件到对象存储
 * @param fileContent 文件内容 Buffer
 * @param fileName 文件名（如 "images/xxx.jpg"）
 * @param contentType MIME 类型
 * @returns 存储 key（永久有效）
 */
export async function uploadFile(
  fileContent: Buffer,
  fileName: string,
  contentType?: string
): Promise<string> {
  const storage = getStorage();
  const key = await storage.uploadFile({
    fileContent,
    fileName,
    contentType,
  });
  return key;
}

/**
 * 从 URL 转存文件到对象存储
 * @param url 源文件 URL
 * @returns 存储 key
 */
export async function uploadFromUrl(url: string): Promise<string> {
  const storage = getStorage();
  const key = await storage.uploadFromUrl({
    url,
    timeout: 30000,
  });
  return key;
}

/**
 * 生成签名访问 URL
 * @param key 存储 key
 * @param expireTime 有效期（秒），默认 7 天
 * @returns 签名 URL
 */
export async function getSignedUrl(
  key: string,
  expireTime: number = 604800
): Promise<string> {
  const storage = getStorage();
  const url = await storage.generatePresignedUrl({
    key,
    expireTime,
  });
  return url;
}

/**
 * 删除文件
 * @param key 存储 key
 */
export async function deleteFile(key: string): Promise<boolean> {
  const storage = getStorage();
  const result = await storage.deleteFile({ fileKey: key });
  return result;
}

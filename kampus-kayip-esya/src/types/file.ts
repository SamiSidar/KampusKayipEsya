import { ApiDateString, ApiId } from './common';

export type UploadedFileType =
  | 'IMAGE'
  | 'DOCUMENT'
  | 'OTHER';

export type UploadedFile = {
  id: ApiId;
  fileName: string;
  fileUrl: string;
  fileType: UploadedFileType;
  contentType?: string;
  size?: number;
  uploadedAt?: ApiDateString;
};

export type UploadFileResponse = {
  file: UploadedFile;
};

export type UploadFileRequest = {
  file: unknown;
  usage:
    | 'FOUND_ITEM_IMAGE'
    | 'LOST_REPORT_IMAGE'
    | 'PROFILE_IMAGE'
    | 'OTHER';
};
``
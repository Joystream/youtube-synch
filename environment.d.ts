declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      AWS_DYNAMODB_TABLE_NAME: string;
      AWS_REGION: string;
      AWS_PROFILE_NAME: string;
      PORT?: string;
      YOUTUBE_API_KEY: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

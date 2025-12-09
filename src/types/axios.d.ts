import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * Skip global error handler toast when true.
     */
    skipGlobalErrorHandler?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    /**
     * Skip global error handler toast when true.
     */
    skipGlobalErrorHandler?: boolean;
  }
}


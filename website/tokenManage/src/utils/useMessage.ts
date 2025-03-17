import { message } from 'antd';
import { useCallback } from 'react';

interface MessageOptions {
  duration?: number;
}

export const useMessage = () => {
  const success = useCallback((content: string, options?: MessageOptions) => {
    message.success(content, options?.duration);
  }, []);

  const error = useCallback((content: string, options?: MessageOptions) => {
    message.error(content, options?.duration);
  }, []);

  const warning = useCallback((content: string, options?: MessageOptions) => {
    message.warning(content, options?.duration);
  }, []);

  const info = useCallback((content: string, options?: MessageOptions) => {
    message.info(content, options?.duration);
  }, []);

  return {
    success,
    error, 
    warning,
    info
  };
};

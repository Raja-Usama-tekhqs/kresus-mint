export const mockSentry = {
  user: {
    is_debugging: true,
  },
  captureException(error: Error, options: any) {
    console.log('Sentry Error Options: ', options);
    console.error(error);
  },
  captureMessage(message: string) {
    console.log('Sentry Message:', message);
  },
};

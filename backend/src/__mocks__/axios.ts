// Mock AxiosError class
export class AxiosError extends Error {
  code?: string;
  config?: any;
  request?: any;
  response?: any;
  isAxiosError: boolean = true;
  toJSON?: () => object;
  
  constructor(message?: string, code?: string, config?: any, request?: any, response?: any) {
    super(message);
    this.code = code;
    this.config = config;
    this.request = request;
    this.response = response;
    Object.setPrototypeOf(this, AxiosError.prototype);
  }
}

const axios: any = {
  post: jest.fn(() => Promise.resolve({ data: {} })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function() { return axios; }),
  defaults: {
    headers: {
      common: {},
      post: {},
      get: {},
      put: {},
      delete: {},
      patch: {},
    },
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  AxiosError: AxiosError,
  isAxiosError: jest.fn((thing: any) => thing instanceof AxiosError),
};

export default axios;

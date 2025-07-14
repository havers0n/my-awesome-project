import './setup';

// Mock external dependencies for unit tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock Redis for unit tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    ttl: jest.fn(),
    flushdb: jest.fn(),
    quit: jest.fn(),
  }));
});

// Mock email service
jest.mock('@services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
  })),
}));

// Mock file upload service
jest.mock('@services/upload.service', () => ({
  UploadService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({ url: 'https://example.com/file.jpg' }),
    deleteFile: jest.fn().mockResolvedValue(true),
    getFileUrl: jest.fn().mockReturnValue('https://example.com/file.jpg'),
  })),
}));

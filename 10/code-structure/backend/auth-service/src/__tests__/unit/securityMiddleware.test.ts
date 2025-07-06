import { Request, Response, NextFunction } from 'express';
import { validateOrigin, sanitizeInput } from '../../middleware/securityMiddleware';

describe('SecurityMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.CORS_ORIGIN;
    delete process.env.NODE_ENV;
  });

  describe('validateOrigin', () => {
    it('should call next in development environment', () => {
      process.env.NODE_ENV = 'development';
      mockRequest.headers = { origin: 'http://localhost:3000' };

      validateOrigin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next if origin is allowed in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com,https://app.example.com';
      mockRequest.headers = { origin: 'https://example.com' };

      validateOrigin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 if origin is not allowed in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com,https://app.example.com';
      mockRequest.headers = { origin: 'https://malicious.com' };

      validateOrigin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Origen no autorizado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if no origin header in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com';
      mockRequest.headers = {};

      validateOrigin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Origen no autorizado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty CORS_ORIGIN in production', () => {
      process.env.NODE_ENV = 'production';
      mockRequest.headers = { origin: 'https://example.com' };

      validateOrigin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from string inputs', () => {
      mockRequest.body = {
        name: 'John<script>alert("xss")</script>Doe',
        email: 'test@example.com'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        name: 'JohnDoe',
        email: 'test@example.com'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      mockRequest.body = {
        user: {
          name: 'John<script>alert("xss")</script>',
          details: {
            bio: 'Hello<script>evil()</script>world'
          }
        }
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        user: {
          name: 'John',
          details: {
            bio: 'Helloworld'
          }
        }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle non-object and non-string values', () => {
      mockRequest.body = {
        count: 123,
        active: true,
        data: null,
        items: [1, 2, 3]
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        count: 123,
        active: true,
        data: null,
        items: [1, 2, 3]
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      mockRequest.body = {};

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({});
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle case-insensitive script tags', () => {
      mockRequest.body = {
        content: 'Text<SCRIPT>alert("test")</SCRIPT>more<ScRiPt>bad()</ScRiPt>text'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        content: 'Textmoretext'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle script tags with attributes', () => {
      mockRequest.body = {
        content: '<script type="text/javascript" src="evil.js">alert("xss")</script>Clean text'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        content: 'Clean text'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve non-script HTML tags', () => {
      mockRequest.body = {
        content: '<div>Safe content</div><p>More safe content</p><script>evil()</script>'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({
        content: '<div>Safe content</div><p>More safe content</p>'
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

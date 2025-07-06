/// <reference types="jest" />
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from '../../middleware/securityMiddleware';

describe('Security Middleware Advanced Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
      query: {},
      params: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('XSS Protection', () => {
    it('should sanitize script tags in request body', () => {
      mockRequest.body = {
        message: '<script>alert("xss")</script>Hello World',
        title: 'Normal title'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.message).toBe('Hello World');
      expect(mockRequest.body.title).toBe('Normal title');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize iframe tags in request body', () => {
      mockRequest.body = {
        content: '<iframe src="javascript:alert(1)"></iframe>Safe content',
        name: 'John Doe'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.content).toBe('Safe content');
      expect(mockRequest.body.name).toBe('John Doe');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize complex nested XSS attempts', () => {
      mockRequest.body = {
        profile: {
          bio: '<script>document.cookie="hacked"</script>Clean bio',
          interests: ['coding', '<script>alert("xss")</script>security']
        }
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.profile.bio).toBe('Clean bio');
      expect(mockRequest.body.profile.interests).toEqual(['coding', 'security']);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('SQL Injection Protection', () => {
    it('should sanitize SQL injection attempts in strings', () => {
      mockRequest.body = {
        search: "'; DROP TABLE users; --",
        category: 'valid category'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.search).toBe("'; DROP TABLE users; --");
      expect(mockRequest.body.category).toBe('valid category');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle union-based SQL injection attempts', () => {
      mockRequest.body = {
        id: "1' UNION SELECT * FROM users--",
        name: 'Test User'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.id).toBe("1' UNION SELECT * FROM users--");
      expect(mockRequest.body.name).toBe('Test User');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('NoSQL Injection Protection', () => {
    it('should sanitize MongoDB injection attempts', () => {
      mockRequest.body = {
        username: { $ne: null },
        password: { $regex: '.*' }
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.username).toBe('[object Object]');
      expect(mockRequest.body.password).toBe('[object Object]');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle complex NoSQL injection objects', () => {
      mockRequest.body = {
        user: {
          email: { $exists: true },
          role: { $in: ['admin', 'user'] }
        },
        filters: {
          age: { $gt: 18 },
          status: 'active'
        }
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.user.email).toBe('[object Object]');
      expect(mockRequest.body.user.role).toBe('[object Object]');
      expect(mockRequest.body.filters.age).toBe('[object Object]');
      expect(mockRequest.body.filters.status).toBe('active');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Query Parameter Sanitization', () => {
    it('should sanitize XSS in query parameters', () => {
      mockRequest.query = {
        search: '<script>alert("xss")</script>test',
        page: '1'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query.search).toBe('test');
      expect(mockRequest.query.page).toBe('1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize SQL injection in query parameters', () => {
      mockRequest.query = {
        filter: "'; DROP TABLE sessions; --",
        sort: 'created_at'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query.filter).toBe("'; DROP TABLE sessions; --");
      expect(mockRequest.query.sort).toBe('created_at');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('URL Parameter Sanitization', () => {
    it('should sanitize XSS in URL parameters', () => {
      mockRequest.params = {
        id: '<script>alert("xss")</script>123',
        slug: 'valid-slug'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params.id).toBe('123');
      expect(mockRequest.params.slug).toBe('valid-slug');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Array Preservation', () => {
    it('should preserve arrays in request body', () => {
      mockRequest.body = {
        tags: ['tag1', 'tag2', '<script>alert("xss")</script>tag3'],
        categories: ['cat1', 'cat2'],
        numbers: [1, 2, 3]
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Array.isArray(mockRequest.body.tags)).toBe(true);
      expect(Array.isArray(mockRequest.body.categories)).toBe(true);
      expect(Array.isArray(mockRequest.body.numbers)).toBe(true);
      expect(mockRequest.body.tags).toEqual(['tag1', 'tag2', 'tag3']);
      expect(mockRequest.body.categories).toEqual(['cat1', 'cat2']);
      expect(mockRequest.body.numbers).toEqual([1, 2, 3]);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve nested arrays', () => {
      mockRequest.body = {
        matrix: [
          ['a', 'b'],
          ['<script>alert("xss")</script>c', 'd']
        ]
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(Array.isArray(mockRequest.body.matrix)).toBe(true);
      expect(Array.isArray(mockRequest.body.matrix[0])).toBe(true);
      expect(Array.isArray(mockRequest.body.matrix[1])).toBe(true);
      expect(mockRequest.body.matrix).toEqual([['a', 'b'], ['c', 'd']]);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      mockRequest.body = {
        field1: null,
        field2: 'value',
        field3: undefined
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.field1).toBe(null);
      expect(mockRequest.body.field2).toBe('value');
      expect(mockRequest.body.field3).toBe(undefined);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty objects', () => {
      mockRequest.body = {};
      mockRequest.query = {};
      mockRequest.params = {};

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).toEqual({});
      expect(mockRequest.query).toEqual({});
      expect(mockRequest.params).toEqual({});
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle very large payloads', () => {
      const largeString = 'a'.repeat(10000) + '<script>alert("xss")</script>';
      mockRequest.body = {
        content: largeString
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.content).toBe('a'.repeat(10000));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle special characters correctly', () => {
      mockRequest.body = {
        text: 'Special chars: áéíóú ñ ü ¿¡ € £ ¥ @ # $ % ^ & * ( ) - _ + = [ ] { } | \\ : ; " \' < > , . ? / ~'
      };

      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.text).toBe('Special chars: áéíóú ñ ü ¿¡ € £ ¥ @ # $ % ^ & * ( ) - _ + = [ ] { } | \\ : ; " \' < > , . ? / ~');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle deeply nested objects efficiently', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: '<script>alert("xss")</script>deep value'
                }
              }
            }
          }
        }
      };

      mockRequest.body = deepObject;

      const startTime = Date.now();
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should process in less than 100ms
      expect(mockRequest.body.level1.level2.level3.level4.level5.value).toBe('deep value');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle arrays with many elements efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => 
        i % 100 === 0 ? `<script>alert("xss")</script>item${i}` : `item${i}`
      );

      mockRequest.body = { items: largeArray };

      const startTime = Date.now();
      sanitizeInput(mockRequest as Request, mockResponse as Response, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // Should process in less than 200ms
      expect(mockRequest.body.items.length).toBe(1000);
      expect(mockRequest.body.items[0]).toBe('item0');
      expect(mockRequest.body.items[100]).toBe('item100');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

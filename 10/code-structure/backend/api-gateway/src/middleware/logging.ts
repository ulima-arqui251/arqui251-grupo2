import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log de la request entrante
  console.log(`📝 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Override del método end para capturar la respuesta
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any): any {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Color del status code
    let statusColor = '';
    if (status >= 200 && status < 300) statusColor = '\x1b[32m'; // Verde
    else if (status >= 300 && status < 400) statusColor = '\x1b[33m'; // Amarillo
    else if (status >= 400 && status < 500) statusColor = '\x1b[31m'; // Rojo
    else if (status >= 500) statusColor = '\x1b[35m'; // Magenta
    
    console.log(`📤 [${timestamp}] ${req.method} ${req.originalUrl} - ${statusColor}${status}\x1b[0m - ${duration}ms`);
    
    // Llamar al método original
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
};

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  
  console.error(`❌ [${timestamp}] Error en ${req.method} ${req.originalUrl}:`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.error(`   Request Body:`, JSON.stringify(req.body, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.error(`   Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  next(err);
};

export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir a milisegundos
    
    // Log de performance para requests lentas (>1000ms)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
    
    // Log detallado en desarrollo
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.log(`🐌 Performance: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

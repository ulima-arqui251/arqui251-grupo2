import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3002;

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'studymate',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'studymate_dev'
};

// Test database connection
async function testDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3006',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Content Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'content-service',
    version: '1.0.0'
  });
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.duration,
        c.price,
        c.rating,
        c.students_count as studentsCount,
        c.thumbnail_url as thumbnail,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        i.first_name as instructorFirstName,
        i.last_name as instructorLastName,
        i.email as instructorEmail
      FROM courses c
      LEFT JOIN users i ON c.instructor_id = i.id
      WHERE c.status = 'published'
      ORDER BY c.created_at DESC
    `);
    
    await connection.end();
    
    const courses = (rows as any[]).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: `${course.instructorFirstName} ${course.instructorLastName}`,
      instructorEmail: course.instructorEmail,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      rating: course.rating,
      studentsCount: course.studentsCount,
      thumbnail: course.thumbnail,
      tags: [], // We'll add tags later
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
    
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.duration,
        c.price,
        c.rating,
        c.students_count as studentsCount,
        c.thumbnail_url as thumbnail,
        c.requirements,
        c.what_you_learn as whatYouLearn,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        i.first_name as instructorFirstName,
        i.last_name as instructorLastName,
        i.email as instructorEmail
      FROM courses c
      LEFT JOIN users i ON c.instructor_id = i.id
      WHERE c.id = ? AND c.status = 'published'
    `, [id]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const course = (rows as any[])[0];
    
    // Get lessons for this course
    const [lessonRows] = await connection.execute(`
      SELECT 
        id,
        title,
        description,
        duration,
        order_index as orderIndex,
        is_preview as isPreview
      FROM lessons
      WHERE course_id = ?
      ORDER BY order_index
    `, [id]);
    
    await connection.end();
    
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: `${course.instructorFirstName} ${course.instructorLastName}`,
      instructorEmail: course.instructorEmail,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      rating: course.rating,
      studentsCount: course.studentsCount,
      thumbnail: course.thumbnail,
      requirements: course.requirements ? JSON.parse(course.requirements) : [],
      whatYouLearn: course.whatYouLearn ? JSON.parse(course.whatYouLearn) : [],
      lessons: lessonRows,
      tags: [], // We'll add tags later
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    res.json({
      success: true,
      data: courseData
    });
    
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get courses by category
app.get('/api/courses/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.duration,
        c.price,
        c.rating,
        c.students_count as studentsCount,
        c.thumbnail_url as thumbnail,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        i.first_name as instructorFirstName,
        i.last_name as instructorLastName
      FROM courses c
      LEFT JOIN users i ON c.instructor_id = i.id
      WHERE c.category = ? AND c.status = 'published'
      ORDER BY c.created_at DESC
    `, [category]);
    
    await connection.end();
    
    const courses = (rows as any[]).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: `${course.instructorFirstName} ${course.instructorLastName}`,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      rating: course.rating,
      studentsCount: course.studentsCount,
      thumbnail: course.thumbnail,
      tags: [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
    
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
    
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses by category',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Search courses
app.get('/api/courses/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }
    
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.category,
        c.level,
        c.duration,
        c.price,
        c.rating,
        c.students_count as studentsCount,
        c.thumbnail_url as thumbnail,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        i.first_name as instructorFirstName,
        i.last_name as instructorLastName
      FROM courses c
      LEFT JOIN users i ON c.instructor_id = i.id
      WHERE (c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ?)
        AND c.status = 'published'
      ORDER BY c.created_at DESC
      LIMIT 50
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);
    
    await connection.end();
    
    const courses = (rows as any[]).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: `${course.instructorFirstName} ${course.instructorLastName}`,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      rating: course.rating,
      studentsCount: course.studentsCount,
      thumbnail: course.thumbnail,
      tags: [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
    
    res.json({
      success: true,
      data: courses,
      count: courses.length,
      query: q
    });
    
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching courses',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get lessons for a course
app.get('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        l.id,
        l.title,
        l.description,
        l.content,
        l.video_url as videoUrl,
        l.duration,
        l.order_index as orderIndex,
        l.is_preview as isPreview,
        l.created_at as createdAt,
        l.updated_at as updatedAt
      FROM lessons l
      WHERE l.course_id = ?
      ORDER BY l.order_index
    `, [courseId]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: rows,
      count: (rows as any[]).length
    });
    
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Get lesson by ID
app.get('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        l.id,
        l.course_id as courseId,
        l.title,
        l.description,
        l.content,
        l.video_url as videoUrl,
        l.duration,
        l.order_index as orderIndex,
        l.is_preview as isPreview,
        l.created_at as createdAt,
        l.updated_at as updatedAt
      FROM lessons l
      WHERE l.id = ?
    `, [id]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    await connection.end();
    
    res.json({
      success: true,
      data: (rows as any[])[0]
    });
    
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/health',
      '/api/courses',
      '/api/courses/:id',
      '/api/courses/category/:category',
      '/api/courses/search?q=query',
      '/api/courses/:courseId/lessons',
      '/api/lessons/:id'
    ]
  });
});

// Start server
async function startServer() {
  const dbConnected = await testDbConnection();
  
  if (!dbConnected) {
    console.error('❌ Cannot start server: Database connection failed');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Content Service running on port ${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
}

startServer().catch(console.error);

export default app;

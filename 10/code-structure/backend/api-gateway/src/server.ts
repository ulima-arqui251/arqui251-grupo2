// StudyMate API Gateway Server - Updated port
import { createApp } from './app';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    const app = await createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔗 Content Service: ${process.env.CONTENT_SERVICE_URL || 'http://content-service:3003'}`);
      console.log(`🔗 User Service: ${process.env.USER_SERVICE_URL || 'http://user-service:3005'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start API Gateway:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();

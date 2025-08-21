import path from 'path';
import express from 'express';
import fs from 'fs';

/**
 * Sets up static file serving for the Express app in production
 * @param app Express application instance
 */
export function setupStaticServing(app: express.Application) {
  console.log(`📁 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Current working directory: ${process.cwd()}`);
  
  // Determine the correct static path based on environment and actual file structure
  let staticPath: string;
  
  if (process.env.NODE_ENV === 'production') {
    // In production, try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'dist', 'public'),  // Standard build output
      path.join(process.cwd(), 'public'),          // Fallback to public in root
      path.join(process.cwd(), 'client', 'dist'),  // Development build
      '/home/app/dist/public',                     // Docker absolute path
      '/home/app/public'                           // Docker fallback
    ];
    
    staticPath = possiblePaths[0]; // Default
    
    for (const tryPath of possiblePaths) {
      console.log(`📁 Checking path: ${tryPath}`);
      if (fs.existsSync(tryPath)) {
        const indexExists = fs.existsSync(path.join(tryPath, 'index.html'));
        console.log(`📁 Path exists: ${tryPath}, index.html: ${indexExists}`);
        if (indexExists) {
          staticPath = tryPath;
          console.log(`✅ Using static path: ${staticPath}`);
          break;
        }
      }
    }
  } else {
    staticPath = path.join(process.cwd(), 'client', 'dist');
  }

  console.log(`📁 Final static path: ${staticPath}`);
  
  // Verify the static path exists
  if (!fs.existsSync(staticPath)) {
    console.error(`❌ Static files directory does not exist: ${staticPath}`);
    console.error('   Available directories in current working directory:');
    
    try {
      const dirs = fs.readdirSync(process.cwd(), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      console.error(`   ${dirs.join(', ')}`);
      
      // Check if dist exists and what's inside
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        const distContents = fs.readdirSync(distPath);
        console.error(`   dist/ contents: ${distContents.join(', ')}`);
      }
      
      // Check if public exists in root
      const publicPath = path.join(process.cwd(), 'public');
      if (fs.existsSync(publicPath)) {
        const publicContents = fs.readdirSync(publicPath);
        console.error(`   public/ contents: ${publicContents.join(', ')}`);
      }
      
    } catch (err) {
      console.error('   Could not list directories:', err);
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.error('   For production deployment, ensure the build process completed successfully');
      // Instead of exiting, continue with a warning
      console.warn('   Continuing without static file serving - API will still work');
      return;
    } else {
      console.warn('   Continuing without static file serving in development mode');
      return;
    }
  }

  // Verify index.html exists
  const indexPath = path.join(staticPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.html not found at: ${indexPath}`);
    
    // List contents of the directory for debugging
    try {
      const files = fs.readdirSync(staticPath);
      console.error('   Directory contents:', files);
    } catch (err) {
      console.error('   Could not read directory contents:', err);
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.warn('   Continuing without SPA routing - API will still work');
      // Don't exit, just continue without SPA routing
    } else {
      console.warn('   Continuing without index.html in development mode');
      return;
    }
  } else {
    console.log(`✅ Index.html confirmed at: ${indexPath}`);
  }

  console.log(`✅ Static files directory confirmed: ${staticPath}`);

  // Serve static files with proper caching headers
  app.use(express.static(staticPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const fileName = path.basename(filePath);
      
      // Don't cache index.html to ensure app updates are loaded
      if (fileName === 'index.html') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      
      // Cache static assets for a long time
      else if (fileName.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      }
    }
  }));

  // Only set up SPA routing if index.html exists
  if (fs.existsSync(indexPath)) {
    // For any other routes that don't start with /api/, serve the index.html file (SPA routing)
    app.get('/*splat', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }

      // Skip health check route
      if (req.path === '/health') {
        return next();
      }

      // Skip static assets (they should be served by the static middleware above)
      if (req.path.includes('.')) {
        return next();
      }

      console.log(`🔄 Serving SPA route: ${req.path} from ${indexPath}`);

      // Send index.html for all other routes (SPA routing)
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send(`
            <html>
              <head><title>Error - Outdoor Team</title></head>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Error cargando la aplicación</h1>
                <p>Por favor, intenta nuevamente en unos minutos.</p>
                <p><a href="/api/health">Check API Health</a></p>
              </body>
            </html>
          `);
        }
      });
    });
  } else {
    // Fallback route when index.html is not available
    app.get('/*splat', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }

      // Skip health check route
      if (req.path === '/health') {
        return next();
      }

      // Skip static assets
      if (req.path.includes('.')) {
        return next();
      }

      // Send a basic response indicating the app is running but frontend is not built
      res.status(200).send(`
        <html>
          <head><title>Outdoor Team - API Active</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Outdoor Team API</h1>
            <p>El servidor está funcionando correctamente.</p>
            <p>Frontend no está disponible - ejecuta <code>npm run build</code></p>
            <p><a href="/health">API Health Check</a></p>
          </body>
        </html>
      `);
    });
  }

  console.log('✅ Static file serving configured for production deployment');
  console.log(`   📂 Static path: ${staticPath}`);
  console.log(`   📄 Index path: ${indexPath}`);
  console.log(`   🌐 Ready for app.outdoorteam.com deployment`);
}

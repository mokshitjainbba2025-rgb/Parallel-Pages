import appPromise from '../server.js';

export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('Error in Vercel function:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

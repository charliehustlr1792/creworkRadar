export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  await fetch(`${baseUrl}/api/signals/collect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
  })
  return Response.json({ triggered: true, at: new Date().toISOString() })
}
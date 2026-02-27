import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

export function Page() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Task Manager</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Stay on top of your work with a focused, personal task workspace.
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize tasks, track deadlines, and monitor your progress. Create, edit, and complete
            tasks from any device with secure authentication.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Log In</Button>
            </Link>
          </div>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <h2 className="text-lg font-semibold">Why teams choose us</h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="space-y-3">
              <li>✔ Quick task creation with priorities, due dates, and tags.</li>
              <li>✔ Dashboards that summarize what is due soon and overdue.</li>
              <li>✔ Secure per-user ownership with JWT-based authentication.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'Plan', text: 'Capture every task and set due dates to stay ahead.' },
          { title: 'Execute', text: 'Filter and search to focus on what matters today.' },
          { title: 'Review', text: 'Track progress with status summaries and upcoming alerts.' },
        ].map(item => (
          <Card key={item.title}>
            <CardHeader>
              <h3 className="text-base font-semibold">{item.title}</h3>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.text}</CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default Page;

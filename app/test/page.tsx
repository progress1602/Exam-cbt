import Test from "../components/Test";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined
  }>;
}) {
  const subjects = (await searchParams).subjects;
  const year = (await searchParams).year;
  return <Test subjectsParam={subjects} yearParam={year}/>;
}

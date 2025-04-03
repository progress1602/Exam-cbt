import Test from "../components/Test";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{[key: string]: string | string[] | undefined
  }>;
}) {
  const subjects = (await searchParams).subjects;
  const year = (await searchParams).year;
  const isComp = (await searchParams).competition;
  return <Test subjectsParam={subjects} yearParam={year} compParam={isComp}/>;
}

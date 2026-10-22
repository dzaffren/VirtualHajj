// The system's doa block: the Arabic in Amiri, right to left in its own block, then its reading and its meaning.
export function DoaBlock({
  doa,
  reading,
  meaning,
}: {
  doa: string;
  reading: string;
  meaning: string;
}) {
  return (
    <div className="doa">
      <p className="doa-arabic" lang="ar" dir="rtl">
        {doa}
      </p>
      <p className="doa-reading">{reading}</p>
      <p className="doa-meaning">{meaning}</p>
    </div>
  );
}

// Seven marks: filled in ink once a round counts, accent for the round being walked.
export function ProgressMarks({
  counted,
  walking,
}: {
  counted: number;
  walking: boolean;
}) {
  return (
    <div className="marks" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className={
            i < counted
              ? "mark done"
              : i === counted && walking
                ? "mark now"
                : "mark"
          }
        />
      ))}
    </div>
  );
}

export default function MarkerBounce() {
  return (
    <style>{`
         @keyframes bounce {
           0%, 100% { transform: translateY(0); }
           25% { transform: translateY(-12px); }
           50% { transform: translateY(0); }
           75% { transform: translateY(-6px); }
         }
         .bounce { animation: bounce 0.6s ease-in-out infinite; }
       `}</style>
  );
}

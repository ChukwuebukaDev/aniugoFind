import { useState } from "react";

export default function Card() {
  return (
    <div className="card">
      <div className="up">
        <div title="minimise" className="child"></div>
        <div title="maximize" className="child"></div>
        <div title="close" className="child"></div>
      </div>
      <div className="down">
        <section className="digits"></section>
      </div>
    </div>
  );
}

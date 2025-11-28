import ConfirmModal from "./Notifications/ConfirmModal";
import { useState, useEffect } from "react";
import { findClosestToStartRoad } from "./closestPairsCalculation";
import { usePointsStore } from "../Zustand/MapStateManager";
import { navigateToPoint } from "./navigationToPoint";
import ClipLoader from "react-spinners/ClipLoader";

export default function AniugoDefaultNavigationSystem() {
  const [show, setShow] = useState(false);
  const [startingPoint, setStartingPoint] = useState(null);
  const [loadingClosest, setLoadingClosest] = useState(false);
  const [loadingNavigate, setLoadingNavigate] = useState(false);

  const { points } = usePointsStore();

  // Find closest point
  useEffect(() => {
    const getClosestPoint = async () => {
      setLoadingClosest(true);
      const data = await findClosestToStartRoad(points);
      if (data) {
        const firstPoint = data.pair?.[data.pair.length - 1];
        if (firstPoint) setStartingPoint(firstPoint);
      }
      setLoadingClosest(false);
    };

    if (points?.length) getClosestPoint();
  }, [points]);

  // Show modal on mount
  useEffect(() => {
    if (points?.length > 1) {
      setShow(true);
    }
  }, [points]);

  // Handle navigation with spinner
  const handleConfirm = async () => {
    if (!startingPoint) return;

    setLoadingNavigate(true); // show spinner

    // optional short delay to make spinner noticeable
    await new Promise((res) => setTimeout(res, 300));

    navigateToPoint(startingPoint);

    setLoadingNavigate(false); // hide spinner
    setShow(false); // close modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[1500] pointer-events-none">
      <ConfirmModal
        show={show}
        onCancel={() => setShow(false)}
        onConfirm={handleConfirm}
        reply={
          loadingNavigate ? (
            <span className="flex items-center gap-2">
              <ClipLoader size={20} color="#06b6d4" />
              Navigating...
            </span>
          ) : (
            "Proceed"
          )
        }
        message="Would you like Aniugo Find to help navigate your points?"
        disabled={loadingClosest || loadingNavigate}
        className="w-full max-w-md sm:max-w-lg" // responsive modal width
      />
    </div>
  );
}

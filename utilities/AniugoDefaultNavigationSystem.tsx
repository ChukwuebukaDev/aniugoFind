import { useState, useEffect } from "react";
import ConfirmModal from "./Notifications/ConfirmModal";
import { findClosestToStartRoad } from "./closestPairsCalculation";
import { usePointsStore } from "../Zustand/MapStateManager";
import { navigateToPoint } from "./navigationToPoint";
import ClipLoader from "react-spinners/ClipLoader";

interface Point {
  lat: number;
  lng: number;
  [key: string]: any;
}

interface ClosestResult {
  pair?: Point[];
  closestPoint?: Point;
  [key: string]: any;
}

export default function AniugoDefaultNavigationSystem(): JSX.Element | null {
  const [show, setShow] = useState<boolean>(false);
  const [startingPoint, setStartingPoint] = useState<Point | null>(null);
  const [loadingClosest, setLoadingClosest] = useState<boolean>(false);
  const [loadingNavigate, setLoadingNavigate] = useState<boolean>(false);

  const { points } = usePointsStore() as { points: Point[] };

  // Compute closest road-based point

  useEffect(() => {
    if (!points || points.length === 0) return;

    const getClosestPoint = async () => {
      try {
        setLoadingClosest(true);

        const data: ClosestResult | null = await findClosestToStartRoad(points);

        if (data) {
          // More consistent extraction
          const resolved =
            data.closestPoint ?? data.pair?.[data.pair.length - 1] ?? null;

          if (resolved) {
            setStartingPoint(resolved);
          }
        }
      } finally {
        setLoadingClosest(false);
      }
    };

    getClosestPoint();
  }, [points]);

  //  Show modal when points load
  useEffect(() => {
    if (points?.length > 1) {
      setShow(true);
    }
  }, [points]);

  //Navigate Actions
  const handleConfirm = async (): Promise<void> => {
    if (!startingPoint) return;

    setLoadingNavigate(true);

    await new Promise((res) => setTimeout(res, 300));

    navigateToPoint(startingPoint);

    setLoadingNavigate(false);
    setShow(false);
  };

  // Don't render if no UI needed
  if (!show) return null;

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
        className="w-full max-w-md sm:max-w-lg"
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";

type AxisRange = [number, number];

export interface FloatingMotionConfig {
  id: string;
  xRange?: AxisRange;
  yRange?: AxisRange;
  speed?: number;
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickNormalized(hash: number, offset: number) {
  const next = Math.sin(hash * 0.0017 + offset * 78.233) * 43758.5453;
  return next - Math.floor(next);
}

function createAxisParams(id: string, axis: "x" | "y", range: AxisRange, speed: number) {
  const seed = hashString(`${id}-${axis}`);
  const min = range[0];
  const max = range[1];
  const center = (min + max) / 2;
  const radius = (max - min) / 2;

  return {
    center,
    radius,
    frequencyA: (0.28 + pickNormalized(seed, 1) * 0.22) * speed,
    frequencyB: (0.12 + pickNormalized(seed, 2) * 0.16) * speed,
    frequencyC: (0.06 + pickNormalized(seed, 3) * 0.08) * speed,
    phaseA: pickNormalized(seed, 3) * Math.PI * 2,
    phaseB: pickNormalized(seed, 4) * Math.PI * 2,
    phaseC: pickNormalized(seed, 5) * Math.PI * 2,
    mixA: 0.52 + pickNormalized(seed, 6) * 0.16,
    mixB: 0.24 + pickNormalized(seed, 7) * 0.16,
    envelopeFrequency: 0.045 + pickNormalized(seed, 8) * 0.035,
    envelopePhase: pickNormalized(seed, 9) * Math.PI * 2,
    driftFrequency: 0.04 + pickNormalized(seed, 10) * 0.03,
    driftPhase: pickNormalized(seed, 11) * Math.PI * 2,
    driftStrength: 0.08 + pickNormalized(seed, 12) * 0.08
  };
}

function sampleAxis(
  timeSeconds: number,
  params: ReturnType<typeof createAxisParams>,
) {
  const waveA = Math.sin(timeSeconds * params.frequencyA + params.phaseA);
  const waveB = Math.cos(timeSeconds * params.frequencyB + params.phaseB);
  const waveC = Math.sin(timeSeconds * params.frequencyC + params.phaseC);
  const envelope =
    0.78 +
    0.18 * ((Math.sin(timeSeconds * params.envelopeFrequency + params.envelopePhase) + 1) / 2);
  const drift = Math.sin(timeSeconds * params.driftFrequency + params.driftPhase) * params.driftStrength;
  const normalized =
    (waveA + params.mixA * waveB + params.mixB * waveC) / (1 + params.mixA + params.mixB);
  const softened = Math.max(-1, Math.min(1, normalized * envelope + drift));

  return params.center + params.radius * softened;
}

export function useFloatingMotion({
  id,
  xRange = [-6, 6],
  yRange = [-6, 6],
  speed = 1
}: FloatingMotionConfig) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pausedRef = useRef(false);
  const pauseStartedAtRef = useRef(0);
  const pausedDurationRef = useRef(0);
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const xParams = useMemo(
    () => createAxisParams(id, "x", [xMin, xMax], speed),
    [id, speed, xMin, xMax],
  );
  const yParams = useMemo(
    () => createAxisParams(id, "y", [yMin, yMax], speed),
    [id, speed, yMin, yMax],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      x.set(0);
      y.set(0);
      return;
    }

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!pausedRef.current) {
        const elapsed = (now - startTime - pausedDurationRef.current) / 1000;
        x.set(sampleAxis(elapsed, xParams));
        y.set(sampleAxis(elapsed, yParams));
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion, x, y, xParams, yParams]);

  const handleHoverStart = () => {
    if (prefersReducedMotion || pausedRef.current) {
      return;
    }

    pausedRef.current = true;
    pauseStartedAtRef.current = performance.now();
  };

  const handleHoverEnd = () => {
    if (prefersReducedMotion || !pausedRef.current) {
      return;
    }

    pausedDurationRef.current += performance.now() - pauseStartedAtRef.current;
    pausedRef.current = false;
  };

  return {
    x,
    y,
    handleHoverStart,
    handleHoverEnd
  };
}

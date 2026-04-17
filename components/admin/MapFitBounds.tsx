"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface Props {
  bounds: Array<[number, number]>;
}

export function MapFitBounds({ bounds }: Props) {
  const map = useMap();

  useEffect(() => {
    if (bounds.length === 0) return;
    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
      return;
    }
    const L = (window as unknown as Record<string, unknown>).L as {
      latLngBounds: (latlngs: Array<[number, number]>) => unknown;
    };
    if (L?.latLngBounds) {
      const b = L.latLngBounds(bounds);
      map.fitBounds(b as Parameters<typeof map.fitBounds>[0], {
        padding: [30, 30],
        maxZoom: 16,
      });
    }
  }, [map, bounds]);

  return null;
}

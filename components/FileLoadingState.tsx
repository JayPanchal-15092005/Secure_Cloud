"use client";

import { Spinner } from "./ui/spinner";

export default function FileLoadingState() {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <Spinner size="large"/>
      <p className="mt-4 text-default-600">Loading your files...</p>
    </div>
  );
}
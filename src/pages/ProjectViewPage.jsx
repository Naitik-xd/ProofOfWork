import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProjectViewPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Project: {id}</h1>
    </div>
  );
}

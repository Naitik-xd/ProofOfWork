import React from 'react';
import { useParams } from 'react-router-dom';

export default function PublicProfilePage() {
  const { username } = useParams();
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Profile: {username}</h1>
    </div>
  );
}

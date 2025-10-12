import React from 'react';
import Head from 'next/head';

/**
 * Reusable component to inject structured data (JSON-LD) into Head
 * @param {Object|Array} data - Schema.org structured data object(s)
 */
const StructuredDataHead = ({ data }) => {
  if (!data) return null;

  const schemas = Array.isArray(data) ? data : [data];

  return (
    <Head>
      {schemas.map((schema, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
};

export default StructuredDataHead;


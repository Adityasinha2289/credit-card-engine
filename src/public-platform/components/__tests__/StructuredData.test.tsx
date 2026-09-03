import { describe, it, expect } from 'vitest';
import { StructuredData } from '../StructuredData';
import React from 'react';

describe('StructuredData', () => {
  it('prevents XSS by escaping HTML tags in JSON string', () => {
    const maliciousData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "</script><script>alert(1)</script>"
    };

    const element = StructuredData({ data: maliciousData });
    const innerHtml = element.props.dangerouslySetInnerHTML.__html;
    
    // The JSON string should have < escaped as \u003c to prevent breaking out of the script tag
    expect(innerHtml).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>');
    // Ensure raw </script> is NOT present
    expect(innerHtml).not.toContain('</script>');
  });
});

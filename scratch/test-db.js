async function testFetch() {
  const rawUrl = 'https://raw.githubusercontent.com/VFAM-Solutions-Private-Limited/Product-1/notes/10-Mathematics/School_notes/10th Math/Bookback/Chapter 1/Exercise 1.1/Q7/Tam.md';
  const url = encodeURI(rawUrl);
  console.log('Fetching encoded:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Status text:', res.statusText);
    if (res.ok) {
      const text = await res.text();
      console.log('Success, length:', text.length);
      console.log('Sample text:', text.substring(0, 100));
    } else {
      console.log('Failed to fetch raw URL.');
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testFetch();

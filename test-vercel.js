const { createClient } = require("@supabase/supabase-js");

const url = "https://lzyvqqmwjjtveavxndev.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZxcW13amp0dmVhdnhuZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODk3NTksImV4cCI6MjA4OTA2NTc1OX0.8ZgiJ3MHFp0LUMuiBrh2p1oWF8Hw_6AlZ0_2lNFBLiM";
const supabase = createClient(url, key);

async function test() {
  const subjectId = "f49a86a9-4472-4840-9e93-ce8ebdb15706";

  const { data: chapterData, error: chapterError } = await supabase
    .from("chapters")
    .select("id, chapter_no, name")
    .eq("subject_id", subjectId)
    .order("chapter_no", { ascending: true });

  console.log("CHAPTER ERROR:", chapterError);
  console.log("CHAPTER DATA LENGTH:", chapterData?.length);

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("chapter_id", { ascending: true })
    .order("id", { ascending: true });

  console.log("QUESTION ERROR:", questionError);
  console.log("QUESTION DATA LENGTH:", questionData?.length);

  if (questionData && questionData.length > 0) {
    console.log("FIRST QUESTION KEYS:", Object.keys(questionData[0]));
  }
}

test();

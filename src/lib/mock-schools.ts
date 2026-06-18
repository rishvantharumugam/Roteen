export interface School {
  id: string;
  name: string;
  district: string;
  type: "Government" | "Private";
}

export const MOCK_SCHOOLS: School[] = [
  // Salem - Government
  { id: "s1", name: "Government Boys Hr Sec School", district: "Salem", type: "Government" },
  { id: "s2", name: "Government Girls Hr Sec School", district: "Salem", type: "Government" },
  { id: "s3", name: "Government Higher Secondary School, Omalur", district: "Salem", type: "Government" },
  { id: "s4", name: "Panchayat Union Middle School, Ayothiapattinam", district: "Salem", type: "Government" },
  // Salem - Private
  { id: "s5", name: "Sri Chaitanya Matric Hr Sec School", district: "Salem", type: "Private" },
  { id: "s6", name: "Senthil Public Matric School", district: "Salem", type: "Private" },
  { id: "s7", name: "Holy Cross Matric School", district: "Salem", type: "Private" },
  { id: "s8", name: "Sri Vidya Mandir Matric School", district: "Salem", type: "Private" },
  { id: "s9", name: "Sri Ramakrishna Matric School", district: "Salem", type: "Private" },
  // Excluded Types (should be filtered out by the logic)
  { id: "e1", name: "Delhi Public School (CBSE)", district: "Salem", type: "Private" },
  { id: "e2", name: "Salem International School (IB)", district: "Salem", type: "Private" },
  
  // Chennai - Government
  { id: "c1", name: "Government Model Higher Secondary School, Saidapet", district: "Chennai", type: "Government" },
  { id: "c2", name: "Presidency Girls Higher Secondary School", district: "Chennai", type: "Government" },
  // Chennai - Private
  { id: "c3", name: "Don Bosco Matriculation Hr Sec School", district: "Chennai", type: "Private" },
  { id: "c4", name: "St. John's Matriculation School", district: "Chennai", type: "Private" },
  { id: "e3", name: "Chettinad Vidyashram (CBSE)", district: "Chennai", type: "Private" },
];

export const getSchoolsSync = (district: string, type: string): School[] => {
  return MOCK_SCHOOLS.filter(s => 
    s.district === district && 
    s.type === type &&
    // Filter out non-state board keywords
    !s.name.toLowerCase().includes("cbse") &&
    !s.name.toLowerCase().includes("icse") &&
    !s.name.toLowerCase().includes("international") &&
    !s.name.toLowerCase().includes("ib") &&
    !s.name.toLowerCase().includes("cambridge")
  );
};

export const fetchSchools = async (district: string, type: string): Promise<School[]> => {
  return getSchoolsSync(district, type);
};


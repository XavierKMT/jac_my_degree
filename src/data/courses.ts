export enum CourseSection {
  English = "English",
  French = "French",
  Humanities = "Humanities",
  Physics = "Physics",
  Biology = "Biology",
  Chemistry = "Chemistry",
  Math = "Math",
  PhysEd = "Phys Ed.",
  Complementary = "Complementary",
  Project = "Project"
}

export type Course = {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[];
  french?: Course;
  editable?: boolean;
  section: CourseSection;
  defaultSemester?: number;
  choiceGroup?: string;
};

export const courses: Course[] = [
  {
    id: "603-101-MQ",
    code: "603-101-MQ",
    name: "ENGLISH",
    credits: 0,
    section: CourseSection.English,
    defaultSemester: 1
  },
  {
    id: "109-1__-MQ-1",
    code: "109-1__-MQ",
    name: "PHYSICAL EDUCATION",
    credits: 0,
    editable: true,
    section: CourseSection.PhysEd,
    defaultSemester: 1
  },
  {
    id: "___-___-__-1",
    code: "___-___-__",
    name: "COURS COMPLÉMENTAIRE (fr)",
    credits: 0,
    editable: true,
    section: CourseSection.Complementary,
    defaultSemester: 1
  },
  {
    id: "201-SN2-RE",
    code: "201-SN2-RE",
    name: "Differential Calculus",
    credits: 0,
    section: CourseSection.Math,
    defaultSemester: 1
  },
  {
    id: "202-SN1-RE",
    code: "202-SN1-RE",
    name: "General Chemistry",
    credits: 0,
    section: CourseSection.Chemistry,
    defaultSemester: 1
  },
  {
    id: "203-SN1-RE",
    code: "203-SN1-RE",
    name: "Mechanics",
    credits: 0,
    section: CourseSection.Physics,
    defaultSemester: 1
  },
  // ------------------------------
  {
    id: "603-1__-MQ-1",
    code: "603-1__-MQ",
    name: "ENGLISH",
    credits: 0,
    editable: true,
    section: CourseSection.English,
    defaultSemester: 2
  },
  {
    id: "345-1__-MQ-1",
    code: "345-1__-MQ",
    name: "HUMANITIES",
    credits: 0,
    editable: true,
    section: CourseSection.Humanities,
    defaultSemester: 2
  },
  {
    id: "602-1__-MQ",
    code: "602-1__-MQ",
    name: "FRENCH",
    credits: 0,
    editable: true,
    section: CourseSection.French,
    defaultSemester: 2
  },
  {
    id: "202-SN2-RE",
    code: "202-SN2-RE",
    name: "Chemistry of Solutions",
    credits: 0,
    section: CourseSection.Chemistry,
    defaultSemester: 2,
    french: {
      id: "202-SF2-AB",
      code: "202-SF2-AB",
      name: "Chimie des solutions",
      credits: 0,
      section: CourseSection.Chemistry
    }
  },
  {
    id: "201-SN3-RE",
    code: "201-SN3-RE",
    name: "Integral Calculus",
    credits: 0,
    section: CourseSection.Math,
    defaultSemester: 2,
    french: {
      id: "201-SF3-AB",
      code: "201-SF3-AB",
      name: "Calcul intégral",
      credits: 0,
      section: CourseSection.Math
    }
  },
  // ------------------------------
  {
    id: "420-SN1-RE",
    code: "420-SN1-RE",
    name: "Programming in Science",
    credits: 0,
    section: CourseSection.Math,
    choiceGroup: "first&second"
  },
  {
    id: "201-SN1-RE",
    code: "201-SN1-RE",
    name: "Probability and Statistics",
    credits: 0,
    section: CourseSection.Math,
    choiceGroup: "first&second"
  },
  // ------------------------------
  {
    id: "101-SN1-RE",
    code: "101-SN1-RE",
    name: "Cellular Biology",
    credits: 0,
    section: CourseSection.Biology,
    choiceGroup: "second&third"
  },
  {
    id: "203-SN3-RE",
    code: "203-SN3-RE",
    name: "Waves and Modern Physics",
    credits: 0,
    section: CourseSection.Physics,
    choiceGroup: "second&third"
  },
  // ------------------------------
  {
    id: "603-1__-MQ-2",
    code: "603-1__-MQ",
    name: "ENGLISH",
    credits: 0,
    editable: true,
    section: CourseSection.English,
    defaultSemester: 3
  },
  {
    id: "345-1__-MQ-2",
    code: "345-1__-MQ",
    name: "HUMANITIES",
    credits: 0,
    editable: true,
    section: CourseSection.Humanities,
    defaultSemester: 3
  },
  {
    id: "109-1__-MQ-2",
    code: "109-1__-MQ",
    name: "PHYSICAL EDUCATION",
    credits: 0,
    editable: true,
    section: CourseSection.PhysEd,
    defaultSemester: 3
  },
  {
    id: "___-___-__-2",
    code: "___-___-__",
    name: "COURS COMPLÉMENTAIRE (fr)",
    credits: 0,
    editable: true,
    section: CourseSection.Complementary,
    defaultSemester: 3
  },
  // ------------------------------
  {
    id: "101-SN2-RE",
    code: "101-SN2-RE",
    name: "Ecology and Evolution",
    credits: 0,
    section: CourseSection.Biology,
    french: {
      id: "101-SF2-AB",
      code: "101-SF2-AB",
      name: "Écologie et évolution",
      credits: 0,
      section: CourseSection.Biology
    }
  },
  {
    id: "203-SN2-RE",
    code: "203-SN2-RE",
    name: "Electricity and Magnetism",
    credits: 0,
    section: CourseSection.Physics,
    french: {
      id: "203-SF2-AB",
      code: "203-SF2-AB",
      name: "Électricité et magnétisme",
      credits: 0,
      section: CourseSection.Physics
    }
  },
  {
    id: "201-SN4-RE",
    code: "201-SN4-RE",
    name: "Linear Algebra and Vector Geometry",
    credits: 0,
    section: CourseSection.Math,
  },
  // ------------------------------
  {
    id: "603-200-AB",
    code: "603-200-AB",
    name: "ENGLISH",
    credits: 0,
    section: CourseSection.English,
    defaultSemester: 4
  },
  {
    id: "345-2__-AB",
    code: "345-2__-AB",
    name: "HUMANITIES",
    credits: 0,
    editable: true,
    section: CourseSection.Humanities,
    defaultSemester: 4
  },
  {
    id: "109-103-MQ",
    code: "109-103-MQ",
    name: "PHYSICAL EDUCATION",
    credits: 0,
    section: CourseSection.PhysEd,
    defaultSemester: 4
  },
  {
    id: "602-2__-AB",
    code: "602-2__-AB",
    name: "FRENCH",
    credits: 0,
    editable: true,
    section: CourseSection.French,
    defaultSemester: 4
  },
  {
    id: "360-PRO-AB",
    code: "360-PRO-AB",
    name: "Science Project",
    credits: 0,
    section: CourseSection.Project,
    defaultSemester: 4
  },
  {
    id: "___-___-__-3",
    code: "___-___-__",
    name: "Science Option 1",
    credits: 0,
    editable: true,
    section: CourseSection.Complementary,
    defaultSemester: 4
  },
];
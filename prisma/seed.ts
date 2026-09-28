import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

async function main() {
  await prisma.notificationRecipient.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.document.deleteMany()
  await prisma.report.deleteMany()
  await prisma.student.deleteMany()
  await prisma.department.updateMany({ data: { hodId: null } })
  await prisma.faculty.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.program.deleteMany()
  await prisma.department.deleteMany()
  await prisma.heroBanner.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      password: await hashPassword("123"),
      name: "Admin",
      role: "admin",
      isActive: true,
    },
  })

  const departmentData = [
    { name: "AI&DS", code: "AIDS", description: "Artificial Intelligence and Data Science" },
    { name: "AI&ML", code: "AIML", description: "Artificial Intelligence and Machine Learning" },
    { name: "AI", code: "AI", description: "Artificial Intelligence" },
    { name: "DS", code: "DS", description: "Data Science" },
    { name: "CSE", code: "CSE", description: "Computer Science and Engineering" },
    { name: "CYBER SECURITY", code: "CYBER", description: "Cyber Security" },
  ]

  const departments = await Promise.all(
    departmentData.map((department) => prisma.department.create({ data: department }))
  )
  const departmentByCode = new Map(departments.map((department) => [department.code, department]))
  const aidsDept = departments.find((department) => department.code === "AIDS")
  if (!aidsDept) throw new Error("AIDS department was not created")

  const programs = await Promise.all(
    departments.map((department) =>
      prisma.program.create({
        data: {
          id: `prog-${department.code.toLowerCase()}-btech`,
          name: `B.Tech ${department.name}`,
          code: `BT${department.code}`,
          duration: 4,
          departmentId: department.id,
        },
      })
    )
  )
  const aidsProgram = programs.find((program) => program.code === "BTAIDS")
  if (!aidsProgram) throw new Error("AIDS program was not created")
  const programByDepartmentCode = new Map(
    programs.map((program) => [program.code.replace(/^BT/, ""), program])
  )

  const coreSubjectsByDepartment: Record<string, string[]> = {
    AIDS: ["Data Structures", "Artificial Intelligence", "Data Analytics", "Database Management Systems"],
    AIML: ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision"],
    AI: ["AI Fundamentals", "Knowledge Representation", "Intelligent Agents", "Neural Networks"],
    DS: ["Statistics for Data Science", "Data Mining", "Big Data Analytics", "Data Visualization"],
    CSE: ["Operating Systems", "Computer Networks", "Software Engineering", "Compiler Design"],
    CYBER: ["Network Security", "Cryptography", "Ethical Hacking", "Digital Forensics"],
  }

  for (const [departmentCode, subjects] of Object.entries(coreSubjectsByDepartment)) {
    const department = departmentByCode.get(departmentCode)
    if (!department) throw new Error(`${departmentCode} department was not created`)

    await Promise.all(
      subjects.map((subject, index) =>
        prisma.subject.create({
          data: {
            name: subject,
            code: `${departmentCode}-CORE-${index + 1}`,
            departmentId: department.id,
            semester: index + 1,
            isCore: true,
          },
        })
      )
    )
  }

  const facultyData = [
    {
      username: "drpenchalaiah",
      password: "drpenchalaiah123",
      name: "DR Penchalaiah",
      email: "drpenchalaiah@example.com",
      employeeId: "FAC001",
      designation: "HOD",
      specialization: "Artificial Intelligence and Data Science",
      qualification: "Ph.D",
      experience: 20,
    },
    {
      username: "udaykumar",
      password: "udaykumar123",
      name: "Uday Kumar",
      email: "udaykumar@example.com",
      employeeId: "FAC002",
      designation: "Professor",
      specialization: "Data Science",
      qualification: "Ph.D",
      experience: 14,
    },
    {
      username: "panduranga",
      password: "panduranga123",
      name: "Pandu Ranga",
      email: "panduranga@example.com",
      employeeId: "FAC004",
      designation: "Associate Professor",
      specialization: "Artificial Intelligence",
      qualification: "M.Tech",
      experience: 11,
    },
    {
      username: "ashokkumar",
      password: "ashokkumar123",
      name: "Ashok Kumar",
      email: "ashokkumar@example.com",
      employeeId: "FAC005",
      designation: "Assistant Professor",
      specialization: "Cyber Security",
      qualification: "M.Tech",
      experience: 9,
    },
    {
      username: "venkateshgoud",
      password: "venkateshgoud123",
      name: "Venkatesh Goud",
      email: "venkateshgoud@example.com",
      employeeId: "FAC006",
      designation: "Assistant Professor",
      specialization: "Cloud Computing",
      qualification: "M.Tech",
      experience: 8,
    },
    {
      username: "sireesha",
      password: "sireesha123",
      name: "Sireesha",
      email: "sireesha@example.com",
      employeeId: "FAC007",
      designation: "Associate Professor",
      specialization: "Machine Learning",
      qualification: "M.Tech",
      experience: 10,
    },
    {
      username: "jyoshna",
      password: "jyoshna123",
      name: "Jyoshna",
      email: "jyoshna@example.com",
      employeeId: "FAC008",
      designation: "Assistant Professor",
      specialization: "Database Systems",
      qualification: "M.Tech",
      experience: 7,
    },
  ]

  let hodFacultyId = ""
  for (const faculty of facultyData) {
    const user = await prisma.user.create({
      data: {
        username: faculty.username,
        email: faculty.email,
        password: await hashPassword(faculty.password),
        name: faculty.name,
        role: "faculty",
        isActive: true,
      },
    })

    const facultyProfile = await prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId: faculty.employeeId,
        departmentId: aidsDept.id,
        designation: faculty.designation,
        specialization: faculty.specialization,
        qualification: faculty.qualification,
        experience: faculty.experience,
      },
    })

    if (faculty.username === "drpenchalaiah") {
      hodFacultyId = facultyProfile.id
    }
  }

  await prisma.department.update({
    where: { id: aidsDept.id },
    data: { hodId: hodFacultyId },
  })

  const studentData = [
    ...["narasimha", "nithin", "nikhil", "narendra", "nandeedh", "rahulsai", "paramesh"].map((name) => ({
      name,
      departmentCode: "AIDS",
    })),
    { name: "vinod", departmentCode: "AIML" },
    { name: "madhu", departmentCode: "AIML" },
    { name: "balaji", departmentCode: "AI" },
    { name: "naveen", departmentCode: "DS" },
    { name: "naresh", departmentCode: "DS" },
    { name: "kiran", departmentCode: "CSE" },
    { name: "noor", departmentCode: "CSE" },
    { name: "vignesh", departmentCode: "CSE" },
  ]

  for (const [index, student] of studentData.entries()) {
    const { name, departmentCode } = student
    const department = departmentByCode.get(departmentCode)
    const program = programByDepartmentCode.get(departmentCode)
    if (!department || !program) throw new Error(`${departmentCode} student department/program missing`)

    const rollSuffix = String(index + 1).padStart(2, "0")
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)
    const user = await prisma.user.create({
      data: {
        username: name,
        email: `${name}@example.com`,
        password: await hashPassword(`${name}123`),
        name: displayName,
        role: "student",
        isActive: true,
      },
    })

    await prisma.student.create({
      data: {
        userId: user.id,
        enrollmentNo: `23701A30${rollSuffix}`,
        departmentId: department.id,
        programId: program.id,
        semester: 1,
        year: 4,
        section: "A",
        gender: "Male",
      },
    })
  }

  const settings = [
    { key: "site_name", value: "AITS Portal" },
    { key: "site_tagline", value: "Annamacharya Institute of Technology and Sciences" },
    { key: "site_logo", value: "/aits.png" },
    { key: "primary_color", value: "#059669" },
    { key: "contact_email", value: "info@aits.edu.in" },
    { key: "contact_phone", value: "+91 123 456 7890" },
    { key: "address", value: "Annamacharya Institute of Technology and Sciences" },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.create({ data: setting })
  }

  await prisma.heroBanner.create({
    data: {
      title: "Welcome to AITS Portal",
      subtitle: "Annamacharya Institute of Technology and Sciences academic administration",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop",
      isActive: true,
      order: 1,
    },
  })

  const notification = await prisma.notification.create({
    data: {
      title: "Welcome to AITS Portal",
      message: "Welcome to the Annamacharya Institute of Technology and Sciences portal.",
      type: "info",
      targetRole: null,
      createdBy: admin.id,
    },
  })

  const users = await prisma.user.findMany({ where: { isActive: true } })
  for (const user of users) {
    await prisma.notificationRecipient.create({
      data: { notificationId: notification.id, userId: user.id },
    })
  }

  console.log("Seed completed successfully")
  console.log("Admin: admin / 123")
  console.log("Students: narasimha / narasimha123, nithin / nithin123, nikhil / nikhil123, narendra / narendra123, nandeedh / nandeedh123, rahulsai / rahulsai123, paramesh / paramesh123")
  console.log("Branch students: vinod and madhu in AI&ML, balaji in AI, naveen and naresh in DS, kiran/noor/vignesh in CSE")
  console.log("Faculty: udaykumar / udaykumar123, sireesha / sireesha123, jyoshna / jyoshna123, panduranga / panduranga123, ashokkumar / ashokkumar123, venkateshgoud / venkateshgoud123")
  console.log("HOD: drpenchalaiah / drpenchalaiah123")
  console.log("Core subjects: 4 subjects created for every department")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

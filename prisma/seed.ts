import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.record.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  // Create installer users
  const password1 = await bcrypt.hash("installer123", 12);
  const password2 = await bcrypt.hash("installer456", 12);

  const installer1 = await prisma.user.create({
    data: {
      name: "Lars Jensen",
      email: "lars@elinstal.dk",
      passwordHash: password1,
      role: "INSTALLER",
      company: "EL-Instal ApS",
    },
  });

  const installer2 = await prisma.user.create({
    data: {
      name: "Mette Nielsen",
      email: "mette@nordel.dk",
      passwordHash: password2,
      role: "INSTALLER",
      company: "NordEl A/S",
    },
  });

  console.log("✅ Installateur-brugere oprettet");

  // Create units
  const unit1 = await prisma.unit.create({
    data: {
      name: "Villavejen 12",
      address: "Villavejen 12, 2800 Kongens Lyngby",
      publicToken: "demo-enhed-villa-lyngby-2024",
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      name: "Lejlighed 3B - Nørrebro",
      address: "Nørrebrogade 78, 3. tv., 2200 København N",
      publicToken: "demo-enhed-lejlighed-norrebro-2024",
    },
  });

  const unit3 = await prisma.unit.create({
    data: {
      name: "Erhvervslejemål - Vesterbro",
      address: "Vesterbrogade 150, 1620 København V",
    },
  });

  console.log("✅ Enheder oprettet");

  // Create records for unit1
  const record1 = await prisma.record.create({
    data: {
      unitId: unit1.id,
      title: "Installering af ny sikringstavle",
      description:
        "Komplet udskiftning af den gamle sikringstavle fra 1985. Monteret ny Schneider Electric LSE tavle med 18 kredsløb. Installeret HPFI-relæ (30 mA) for alle kredsløb. Alle ledninger er kontrolleret og dokumenteret iht. DS/HD 60364-serien.\n\nArbejdet er udført i henhold til stærkstrømsreglementet og er anmeldt til Elektricitetsrådet.",
      workAt: new Date("2024-03-15T09:00:00"),
      createdById: installer1.id,
    },
  });

  await prisma.record.create({
    data: {
      unitId: unit1.id,
      title: "Udskiftning af stikkontakter i køkken",
      description:
        "Alle eksisterende stikkontakter i køkken er udskiftet til jordforbundne stikkontakter (type K). Installeret 4 stk. dobbelt stikkontakter samt 1 stk. kombineret stikkontakt/USB-oplader over køkkenbordet.\n\nKøkkenets gruppeledning er kontrolleret og godkendt.",
      workAt: new Date("2024-04-02T14:30:00"),
      createdById: installer1.id,
    },
  });

  await prisma.record.create({
    data: {
      unitId: unit1.id,
      title: "Opsætning af udendørs belysning",
      description:
        "Installeret LED-belysningssystem til terrasse og indkørsel. Monteret 6 stk. jordspyd med IP65-godkendte armature. Installeret bevægelsessensor med dagslysstyring (0-200 lux justerbar).\n\nAlt kabel er lagt i jordkabler (XLPE) med min. 0,6 m dybde.",
      workAt: new Date("2024-05-20T08:00:00"),
      createdById: installer2.id,
    },
  });

  // Create records for unit2
  const record4 = await prisma.record.create({
    data: {
      unitId: unit2.id,
      title: "Fejlfinding og reparation - koksende belysning",
      description:
        "Kundehenvendelse om flimrende lys i stue og gang. Årsag identificeret: løs forbindelse i loftdåse i gangen, som forgrenes til stuens kredsløb.\n\nForbindelsen er retableret med korrekt muffer og afdækket med CE-godkendt låge. Kredsløbet er testet og godkendt.",
      workAt: new Date("2024-06-10T11:00:00"),
      createdById: installer1.id,
    },
  });

  await prisma.record.create({
    data: {
      unitId: unit2.id,
      title: "Installation af ladestation til elbil",
      description:
        "Monteret Zaptec Pro 22 kW ladestation på parkeringsareal. Fremført separat 32A/3-faset kursus fra lejlighedens sikringstavle (nyt kredsløb). Installeret energimåler (MID-godkendt) til fakturering.\n\nInstallationen er udført iht. NEND norm for EV-opladere og anmeldt.",
      workAt: new Date("2024-07-08T10:00:00"),
      createdById: installer2.id,
    },
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: "CREATE",
        recordId: record1.id,
        unitId: unit1.id,
        installerId: installer1.id,
        diffJson: JSON.stringify({
          title: "Installering af ny sikringstavle",
          description: "...",
          workAt: "2024-03-15",
        }),
      },
      {
        action: "CREATE",
        recordId: record4.id,
        unitId: unit2.id,
        installerId: installer1.id,
        diffJson: JSON.stringify({
          title: "Fejlfinding og reparation - koksende belysning",
        }),
      },
    ],
  });

  console.log("✅ Registreringer og revisionslog oprettet");
  console.log("\n📋 Demo-adgangsoplysninger:");
  console.log("  Installateur 1: lars@elinstal.dk / installer123");
  console.log("  Installateur 2: mette@nordel.dk / installer456");
  console.log("\n🔗 Kunde-URL eksempler:");
  console.log(
    `  http://localhost:3000/u/demo-enhed-villa-lyngby-2024`
  );
  console.log(
    `  http://localhost:3000/u/demo-enhed-lejlighed-norrebro-2024`
  );
  console.log("\n✅ Seeding afsluttet!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding fejlede:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

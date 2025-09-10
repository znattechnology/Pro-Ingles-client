
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";


import * as schema from "./schema";



const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });




const seed = async () => {
  console.log("Seeding data...");

  try {
    await db.delete(schema.courses);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userProgress);



    await db.insert(schema.courses).values([
        {
            id:1,
            title:"Inglês Geral",
            imageSrc: "/service-1.jpg"
        },
        {
            id:2,
            title:"Inglês para Negócios",
            imageSrc: "/service-2.jpg"
        },
        {
            
            id:3,
            title:"Inglês para Tecnologia",
            imageSrc: "/service-6.jpg"
        },
        {
            
            id:4,
            title:"Inglês para o Setor Bancário",
            imageSrc: "/service-4.jpg"
        },
        {
            
            id:5,
            title:"Inglês para o Setor Petrolífero",
            imageSrc: "/service-5.jpg"
        }
    ]);

    await db.insert(schema.units).values([
      {
        id:1,
        courseId:1,
        title: "Unit 1",
        description:"Learn the basics of Inglish",
        order:1
      }
    ]);
    await db.insert(schema.lessons).values([
      {
      id:1,
      unitId:1,
      order:1,
      title:"Verb to be"

    },
    {
      id:2,
      unitId:1,
      order:2,
      title:"Present continium "

    },
    {
      id:3,
      unitId:1,
      order:3,
      title:"Present continium "

    },
    {
      id:4,
      unitId:1,
      order:4,
      title:"Present continium "

    },
    {
      id:5,
      unitId:1,
      order:5,
      title:"Present continium "

    },
    {
      id:6,
      unitId:1,
      order:6,
      title:"Present continium "

    },
    {
      id:7,
      unitId:1,
      order:7,
      title:"Present continium "

    },
    {
      id:8,
      unitId:1,
      order:8,
      title:"Present continium "

    }
  ]);

  await db.insert(schema.challenges).values([
    {
      id:1,
      lessonId:1,
      type:"SELECT",
      order:1,
      question: 'which one of this is the "the man"?'
    },
    {
      id:2,
      lessonId:1,
      type:"ASSIST",
      order:2,
      question: '"the man"?'
    },
    {
      id:3,
      lessonId:1,
      type:"SELECT",
      order:3,
      question: 'which one of this is the "the man"?'
    },
    
  ]);

  await db.insert(schema.challengeOptions).values([
    {
    
      challengeId:1,
      imageSrc:"/man.jpg",
      correct:true,
      text: "man",
      audioSrc:"/ing_man.mp3",
    },
    {
    
      challengeId:1,
      imageSrc:"/woman.jpg",
      correct:false,
      text: "woman",
      audioSrc:"/ing_woman.mp3",
    },
    {
    
      challengeId:1,
      imageSrc:"/robot.jpg",
      correct:false,
      text: "robot",
      audioSrc:"/ing_robot.mp3",
    }
  ]);
  await db.insert(schema.challengeOptions).values([
    {
    
      challengeId:2,
      imageSrc:"/robot.jpg",
      correct:true,
      text: "man",
      audioSrc:"/ing_man.mp3",
    },
    {
    
      challengeId:2,
      imageSrc:"/robot.jpg",
      correct:false,
      text: "woman",
      audioSrc:"/ing_woman.mp3",
    },
    {
    
      challengeId:2,
      imageSrc:"/robot.jpg",
      correct:false,
      text: "robot",
      audioSrc:"/ing_robot.mp3",
    }
  ]);

  await db.insert(schema.challengeOptions).values([
    {
     
      challengeId:3,
      imageSrc:"/man.jpg",
      correct:false,
      text: "man",
      audioSrc:"/ing_man.mp3",
    },
    {
     
      challengeId:3,
      imageSrc:"/woman.jpg",
      correct:false,
      text: "woman",
      audioSrc:"/ing_woman.mp3",
    },
    {
     
      challengeId:3,
      imageSrc:"/robot.jpg",
      correct:true,
      text: "robot",
      audioSrc:"/ing_robot.mp3",
    }
  ]);

  await db.insert(schema.challenges).values([
    {
      id:4,
      lessonId:2,
      type:"SELECT",
      order:1,
      question: 'which one of this is the "the man"?'
    },
    {
      id:5,
      lessonId:2,
      type:"ASSIST",
      order:2,
      question: '"the man"?'
    },
    {
      id:6,
      lessonId:2,
      type:"SELECT",
      order:3,
      question: 'which one of this is the "the man"?'
    },
    
  ]);

    console.log("Data seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

seed();
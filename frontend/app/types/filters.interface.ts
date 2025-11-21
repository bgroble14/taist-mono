export default interface IFilters {
    preference?: "Men" | "Women" | "Everyone";
    age: [number, number];
    height: [number, number];
    distance: [number];
    ethnicities: string[];
    religion: string[];
    educationLevel: string[];
    sexuality: string[];
    doDrink?: "Yes" | "No" | "Sometimes" | "I don't want to answer this question" | undefined;
    doSmoke?: "Yes" | "No" | "Sometimes" | "I don't want to answer this question" | undefined;
    doDrugs?: "Yes" | "No" | "Sometimes" | "I don't want to answer this question" | undefined;
    doSmokeWeed?: "Yes" | "No" | "Sometimes" | "I don't want to answer this question" | undefined;
    haveChildren: string;
    hobbies: string[];
    familyPlans: string[];
    desiredRelationship: string[];
    favouriteCuisines: string[];
}
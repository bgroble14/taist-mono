export default interface IPersonalInformation {
    age?: number
    height: string
    weight?: string
    gender: string
    ethnicity: string
    city: string
    workLocation?: string
    homeTown?: string
    jobTitle: string
    educationLevel: string
    religion: string
    politicalBelief?: string
    doDrink: string
    doSmoke: string
    doSmokeWeed: string
    doDrugs: string
    location: {
        name: string,
        lat: number,
        lon: number
    }
    sexuality: string
    preference: string
    haveChildren: string
    familyPlan: string
    desiredRelationship: string
    hobbies: string[]
    favoriteCuisine: string
    ethnicPreference?: string
    photos?: { isMain: boolean; photo: string; }[]
    about?: string
    video?: string
}
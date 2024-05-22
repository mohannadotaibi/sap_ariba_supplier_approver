interface paramsArray {
    includeLegalAddress: boolean,
    batchSize: number | null,
    categoryCode: string[] | null,
    regionCode: string[] | null,
    departmentCode: string[] | null,
    includeOrderingAddresses: boolean,
    includeRemittanceAddresses: boolean,
    purchasingUnitCodes: string[] | null,
    registrationStatus: string[] | null,
    registrationUpdateStatus: string[] | null,
    realmName: string,
    smVendorIds: string[] | null,
    filterOutDisqualifiedMatrix: boolean,
    includeMatrix: boolean,
    searchQualificationAndRegistrationStatusAsAWhole: boolean,
    isErpIntegrated: unknown | null,
    keyword: string,
    qualificationStatus: string[] | null,
    preferredLevel: string[] | null,
    spqFilterAnswerRequests: string[] | null,
    certCondition: unknown | null,
    overallRiskScoreLevel: string[] | null,
    smProcessStatus: string[] | null,
    isFactory: boolean,
    activeType: string,
    includeFacet: boolean,
    mainVendorsOnly: boolean,
    isBulkQualification: boolean,
    isMQEnhancementFlow: boolean,
}
declare module "*.vue" {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<object, object, unknown>
    export default component
  }
  
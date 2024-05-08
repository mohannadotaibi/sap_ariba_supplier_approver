export {};

declare global{
    interface paramsArray {
        includeLegalAddress: boolean,
        categoryCode: string[] | null,
        regionCode: string[] | null,
        departmentCode: string[] | null,
        includeOrderingAddresses: boolean,
        includeRemittanceAddresses: boolean,
        purchasingUnitCodes: string[] | null,
        realmName: string,
        smVendorIds: string[] | null,
        filterOutDisqualifiedMatrix: boolean,
        includeMatrix: boolean,
        searchQualificationAndRegistrationStatusAsAWhole: boolean,
        isErpIntegrated: any | null,
        keyword: string,
        qualificationStatus: string[] | null,
        preferredLevel: string[] | null,
        spqFilterAnswerRequests: string[] | null,
        certCondition: {},
        overallRiskScoreLevel: string[] | null,
        smProcessStatus: string[] | null,
        isFactory: boolean,
        activeType: string,
        includeFacet: boolean,
        mainVendorsOnly: boolean,
        isBulkQualification: boolean,
        isMQEnhancementFlow: boolean,
    }
} 
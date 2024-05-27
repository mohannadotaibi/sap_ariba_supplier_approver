interface ParamsArray {
    activeType: string;
  batchSize: number;
  categoryCode: string[];
  certCondition: Record<string, unknown>;
  departmentCode: string[];
  filterOutDisqualifiedMatrix: boolean;
  includeFacet: boolean;
  includeLegalAddress: boolean;
  includeMatrix: boolean;
  includeOrderingAddresses: boolean;
  includeRemittanceAddresses: boolean;
  isBulkQualification: boolean;
  isErpIntegrated: boolean | null;
  isFactory: boolean;
  isMQEnhancementFlow: boolean;
  keyword: string;
  mainVendorsOnly: boolean;
  overallRiskScoreLevel: string[];
  preferredLevel: string[];
  purchasingUnitCodes: string[];
  qualificationStatus: string[];
  realmName: string;
  regionCode: string[];
  registrationStatus: string[];
  registrationUpdateStatus: string[];
  searchQualificationAndRegistrationStatusAsAWhole: boolean;
  smProcessStatus: string[];
  smVendorIds: string[];
  spqFilterAnswerRequests: string[];

}
declare module "*.vue" {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<object, object, unknown>
    export default component
  }
  
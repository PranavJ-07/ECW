import { IssueCertificatesUseCase } from '../../../application/certificates/use-cases/issue-certificates.usecase';
import { ListEventCertificatesUseCase } from '../../../application/certificates/use-cases/list-event-certificates.usecase';
import { GetMyCertificatesUseCase } from '../../../application/certificates/use-cases/get-my-certificates.usecase';
import { GetMyCertificateUseCase } from '../../../application/certificates/use-cases/get-certificate.usecase';
import { RevokeCertificateUseCase } from '../../../application/certificates/use-cases/revoke-certificate.usecase';
import { VerifyCertificateUseCase } from '../../../application/certificates/use-cases/verify-certificate.usecase';
import { CertificateEligibilityService } from '../../../application/certificates/services/certificate-eligibility.service';
import { CertificateIdentityService } from '../../../application/certificates/services/certificate-identity.service';
import { EventAuthorizationService } from '../../../application/events/services/event-authorization.service';
import { certificateRepository } from '../../../infrastructure/database/repositories/certificate.repository';
import { registrationRepository } from '../../../infrastructure/database/repositories/registration.repository';
import { eventRepository } from '../../../infrastructure/database/repositories/event.repository';
import { clubRepository } from '../../../infrastructure/database/repositories/club.repository';
import { userRepository } from '../../../infrastructure/database/repositories/user.repository';
import { membershipRepository } from '../../../infrastructure/database/repositories/membership.repository';
import { CertificateController } from '../controllers/certificate.controller';

const eventAuthService = new EventAuthorizationService(membershipRepository);
const certificateEligibilityService = new CertificateEligibilityService();
const certificateIdentityService = new CertificateIdentityService();

const issueCertificatesUseCase = new IssueCertificatesUseCase(
  certificateRepository,
  registrationRepository,
  eventRepository,
  clubRepository,
  userRepository,
  eventAuthService,
  certificateEligibilityService,
  certificateIdentityService,
);

const listEventCertificatesUseCase = new ListEventCertificatesUseCase(
  certificateRepository,
  eventRepository,
  eventAuthService,
);

const getMyCertificatesUseCase = new GetMyCertificatesUseCase(certificateRepository);
const getMyCertificateUseCase = new GetMyCertificateUseCase(certificateRepository);

const revokeCertificateUseCase = new RevokeCertificateUseCase(
  certificateRepository,
  eventRepository,
  eventAuthService,
);

const verifyCertificateUseCase = new VerifyCertificateUseCase(certificateRepository);

export const certificateController = new CertificateController(
  issueCertificatesUseCase,
  listEventCertificatesUseCase,
  getMyCertificatesUseCase,
  getMyCertificateUseCase,
  revokeCertificateUseCase,
  verifyCertificateUseCase,
);

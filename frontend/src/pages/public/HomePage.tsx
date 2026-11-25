import React from 'react';
import { HeroSection } from '../../sections/hero/HeroSection';
import { HighlightsSection } from '../../sections/statistics/HighlightsSection';
import { ServicesSection } from '../../sections/services/ServicesSection';
import { AboutSection } from '../../sections/about/AboutSection';
import { TechEcosystemSection } from '../../sections/technologies/TechEcosystemSection';
import { ProductsSection } from '../../sections/products/ProductsSection';
import { ProjectsSection } from '../../sections/projects/ProjectsSection';
import { WhyChooseUsSection } from '../../sections/why-us/WhyChooseUsSection';
import { WorkflowSection } from '../../sections/workflow/WorkflowSection';
import { PaymentAndAllocationSection } from '../../sections/payment/PaymentAndAllocationSection';
import { ContactSection } from '../../sections/contact/ContactSection';

/**
 * Dracovion Technologies Official Homepage
 * Complete luxury experience with anchored navigation, payment method policy, and direct chat pathways.
 */
export const HomePage: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-transparent">
      {/* SECTION 01: HERO */}
      <div id="overview">
        <HeroSection />
      </div>

      {/* SECTION 02: COMPANY HIGHLIGHTS */}
      <div id="highlights">
        <HighlightsSection />
      </div>

      {/* SECTION 03: OUR SERVICES */}
      <div id="services">
        <ServicesSection />
      </div>

      {/* SECTION 04: ABOUT DRACOVION */}
      <div id="about">
        <AboutSection />
      </div>

      {/* SECTION 05: TECHNOLOGY ECOSYSTEM */}
      <div id="technologies">
        <TechEcosystemSection />
      </div>

      {/* SECTION 06: PRODUCTS & INNOVATIONS */}
      <div id="products">
        <ProductsSection />
      </div>

      {/* SECTION 07: FEATURED PROJECTS */}
      <div id="projects">
        <ProjectsSection />
      </div>

      {/* SECTION 08: WHY CHOOSE US */}
      <div id="why-us">
        <WhyChooseUsSection />
      </div>

      {/* SECTION 09: DEVELOPMENT WORKFLOW */}
      <div id="workflow">
        <WorkflowSection />
      </div>

      {/* SECTION 10: HOMEPAGE NAVIGATION, PAYMENT & ALLOCATION METHOD */}
      <PaymentAndAllocationSection />

      {/* SECTION 11: CONTACT */}
      <div id="contact">
        <ContactSection />
      </div>
    </div>
  );
};

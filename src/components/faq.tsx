import { faqs } from "@/lib/data";
import { Container, Section } from "@/components/layout";
import { SectionHeader } from "@/components/section-header";
import { Reveal } from "@/components/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <Section id="faq">
      <Container className="max-w-3xl">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before you start speaking."
        />
        <Reveal delay={0.1} className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="py-4 text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  <div className="pb-4">{item.a}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}
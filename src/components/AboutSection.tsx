const AboutSection = () => {
  return (
    <section className="section-padding bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-medium">
            What is this workshop?
          </h2>
          
          <div className="space-y-6 text-foreground/85 leading-relaxed">
            <p>
              This is a space to disconnect from the noise and reconnect with your hands. 
              For three hours, you'll work with clay in a calm, unhurried environment.
            </p>
            
            <p>
              We focus on handbuilding — shaping clay with your fingers, not a wheel. 
              It's intuitive, meditative, and wonderfully forgiving.
            </p>
            
            <p>
              You'll be in a small group, guided gently through the process. 
              There's no pressure to create anything perfect. The goal is simply to create.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

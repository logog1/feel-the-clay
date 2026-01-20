const ProcessSection = () => {
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-medium">
            How pottery works
          </h2>
          
          <div className="space-y-6 text-foreground/85 leading-relaxed">
            <p>
              After you shape your pieces, they need time — time to dry slowly, 
              and time to be fired in a kiln at high temperatures. This process 
              transforms soft clay into lasting ceramic.
            </p>
            
            <p>
              It takes about 3–4 weeks from workshop to finished piece. 
              We'll take care of the drying and firing for you.
            </p>
            
            <div className="bg-sand-light rounded-2xl p-6 mt-8">
              <p className="text-foreground/90">
                <span className="font-medium">We'll reach out</span> when your pieces 
                are ready to be picked up. You can also arrange delivery if you prefer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

import baustLogo from "@/assets/baust-logo.png";

const UniversityCard = () => {
  return (
    <div className="bg-university border border-university-border rounded-xl p-8 text-center">
      <img src={baustLogo} alt="BAUST Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
      <h2 className="text-xl font-display font-bold text-foreground">
        Bangladesh Army University of Science and Technology
      </h2>
      <p className="text-muted-foreground mt-1">Saidpur, Nilphamari</p>
    </div>
  );
};

export default UniversityCard;

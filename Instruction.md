There are several app issues:

1. When I click get started user have not beedn created inside database 
2. Home page should be header welcoming user and on the right side we should show energy points that user can use. Bellow there should be list of ai companions that user can select and open chat with 
3. Chat is availiby is to any user with no subscribtion only premium features avalible with subscribtion plan




const [selectedCompanion, setSelectedCompanion] = useState<AICompanion | null>(null);
  const [showChat, setShowChat] = useState(false);

  // useEffect(() => {
  //   try {
  //     if (miniApp.mountSync.isAvailable()) miniApp.mountSync();
  //     if (backButton.mount.isAvailable()) {
  //       backButton.mount();
  //       backButton.onClick(() => {
  //         if (backButton.isMounted()) backButton.hide();
  //         window.history.back();
  //       });
  //     }
  //     if (closingBehavior.mount.isAvailable()) {
  //       closingBehavior.mount();
  //       if (closingBehavior.enableConfirmation.isAvailable()) closingBehavior.enableConfirmation();
  //     }
  //   } catch (err) {
  //     console.error('Telegram SDK init failed:', err);
  //   }
  //   return () => {
  //     if (backButton.isMounted()) backButton.unmount();
  //   };
  // }, []);

  const handleCompanionSelect = (companion: AICompanion) => {
    setSelectedCompanion(companion);
    setShowChat(true);
  };

  const handleBackToHome = () => {
    setShowChat(false);
    setSelectedCompanion(null);
  };

  const energyForTier = (tier?: string) => (tier === 'FREE' ? 50 : 100);

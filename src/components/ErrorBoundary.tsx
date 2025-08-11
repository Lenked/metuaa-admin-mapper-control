// src/components/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react';

// Interface décrivant les props du composant
interface ErrorBoundaryProps {
  children: ReactNode; // Les enfants que le composant va rendre
  // Vous pouvez ajouter d'autres props ici si nécessaire, par ex: fallbackUI?: ReactNode;
}

// Interface décrivant l'état du composant
interface ErrorBoundaryState {
  hasError: boolean;
  // Vous pouvez ajouter d'autres propriétés d'état ici si nécessaire, par ex: error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initialisation de l'état avec le type défini
    this.state = { hasError: false };
  }

  // Méthode statique appelée lorsqu'une erreur est lancée dans un composant enfant
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    return { hasError: true };
  }

  // Méthode de cycle de vie appelée après qu'une erreur a été attrapée
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport d'erreurs
    console.error("Erreur attrapée par la frontière d'erreur:", error, errorInfo);
    // Exemple: logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de secours
      return <h2>Quelque chose s'est mal passé. Veuillez réessayer.</h2>;
      // Ou afficher un composant plus sophistiqué comme dans mon exemple précédent
    }

    // Si pas d'erreur, rendre les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;